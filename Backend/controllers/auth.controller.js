
import User from '../models/User.model.js';

export const authCallback = async (req, res) => {
    try {
        const { id, email_addresses, first_name, last_name, image_url } = req.body;

        if (!id || !email_addresses) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const email = email_addresses[0]?.email_address;
        const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

        const user = await User.createOrUpdate({
            clerk_id: id,
            email,
            name,
            image: image_url
        });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in auth callback:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
