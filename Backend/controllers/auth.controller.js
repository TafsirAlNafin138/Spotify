
import User from '../models/User.model.js';

export const authCallback = async (req, res) => {
    try {
        const { id, clerk_id, email_addresses, first_name, last_name, image_url } = req.body;

        // Accept either 'id' or 'clerk_id' field
        const clerkUserId = id || clerk_id;

        if (!clerkUserId || !email_addresses) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Clerk uses 'emailAddress' (camelCase), not 'email_address'
        const email = email_addresses[0]?.emailAddress || email_addresses[0]?.email_address;
        const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

        const user = await User.createOrUpdate({
            clerk_id: clerkUserId,
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
