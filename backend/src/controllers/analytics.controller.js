import Payment from '../models/Payment.model.js';
import Subscription from '../models/Subscription.model.js';
import Plan from '../models/Plan.model.js';
import User from '../models/User.model.js';

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private (Admin)
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total revenue (within period)
    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const rawRevenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Fill in missing months with zeros
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const found = rawRevenueByMonth.find(item => item._id.year === year && item._id.month === month);
      months.push({
        month: `${monthNames[month - 1]} ${year}`,
        revenue: found ? found.revenue : 0,
        transactions: found ? found.count : 0
      });
    }

    // Revenue today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const revenueToday = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions: totalRevenue[0]?.count || 0,
        revenueToday: revenueToday[0]?.total || 0,
        revenueByMonth: months
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription analytics
// @route   GET /api/analytics/subscriptions
// @access  Private (Admin)
export const getSubscriptionAnalytics = async (req, res, next) => {
  try {
    // Active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active'
    });

    // Trialing subscriptions
    const trialingSubscriptions = await Subscription.countDocuments({
      status: 'trialing'
    });

    // Canceled subscriptions
    const canceledSubscriptions = await Subscription.countDocuments({
      status: 'canceled'
    });

    // Subscriptions by plan (Active + Trialing)
    const subscriptionsByPlan = await Subscription.aggregate([
      {
        $match: { status: { $in: ['active', 'trialing'] } }
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'plans',
          localField: '_id',
          foreignField: '_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan'
      },
      {
        $project: {
          planName: '$plan.name',
          count: 1
        }
      }
    ]);

    // Subscription growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const rawGrowth = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growth = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const found = rawGrowth.find(item => item._id.year === year && item._id.month === month);
      growth.push({
        month: `${monthNames[month - 1]} ${year}`,
        count: found ? found.count : 0
      });
    }

    // Growth rate (new subscriptions this month vs last month)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthCount = await Subscription.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    });

    const lastMonthCount = await Subscription.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });

    const growthRate = lastMonthCount > 0
      ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
      : 0;

    // Churn rate (cancellations / total active)
    const totalActiveAndTrialing = activeSubscriptions + trialingSubscriptions;
    const churnRate = totalActiveAndTrialing > 0
      ? (canceledSubscriptions / totalActiveAndTrialing) * 100
      : 0;

    res.json({
      success: true,
      data: {
        activeSubscriptions,
        trialingSubscriptions,
        canceledSubscriptions,
        totalSubscriptions: activeSubscriptions + trialingSubscriptions + canceledSubscriptions,
        subscriptionsByPlan,
        subscriptionGrowth: growth,
        growthRate: Math.round(growthRate * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};
