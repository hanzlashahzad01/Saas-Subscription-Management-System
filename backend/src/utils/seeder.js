import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

export const seedAccounts = async () => {
    try {
        // Admin Account
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@admin.com').toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'super_admin'
            });
            console.log('✅ Default Admin account created:', adminEmail);
        } else {
            let updated = false;
            if (adminExists.role !== 'super_admin') {
                adminExists.role = 'super_admin';
                updated = true;
            }
            if (updated) {
                await adminExists.save();
                console.log('✅ Admin account updated');
            }
        }

        // Manager Account
        const managerEmail = (process.env.MANAGER_EMAIL || 'manager@manager.com').toLowerCase();
        const managerPassword = process.env.MANAGER_PASSWORD || 'manager123';

        const managerExists = await User.findOne({ email: managerEmail });
        if (!managerExists) {
            await User.create({
                name: 'Company Manager',
                email: managerEmail,
                password: managerPassword,
                role: 'company_admin'
            });
            console.log('✅ Default Manager account created:', managerEmail);
        } else {
            let updated = false;
            if (managerExists.role !== 'company_admin') {
                managerExists.role = 'company_admin';
                updated = true;
            }
            if (updated) {
                await managerExists.save();
                console.log('✅ Manager account updated');
            }
        }
    } catch (error) {
        console.error('❌ Seeding error:', error);
    }
};
