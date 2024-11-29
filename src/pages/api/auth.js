// import axios from "axios";
// import qs from "qs";

// export default async function handler (req, res) {
//     if (req.method != "POST") {
//         return res.status(405).json({message: "Method not allowed"});
//     }

//     const {username, password} = req.body;

//     try {
//         const response = await axios.post(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/`, 
//         qs.stringify({
//             username,
//             password
//         }), 
//         {
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//                 "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
//             }
//         });

//         return response.status(200).json(response.data); // forward response data to client
//     } catch (error) {
//         const errorMessage = error.response?.data?.detail || "An unexpected error occurred.";
//         return res.status(error.response?.status || 500).json({ message: errorMessage });
//     }
// }

import qs from "qs";
import axios from "axios";

export const config = {
    api: {
        bodyParser: true, // Body parsing is enabled by default in Next.js
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    console.log("Request Data:", { username, password });
    console.log("Environment Variables:", {
        BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    });

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/token/`,
            qs.stringify({ username, password }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
                },
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error during API call:", error.response?.data || error.message);

        const errorMessage =
            error.response?.data?.detail || "An unexpected error occurred.";
        
        return res.status(error.response?.status || 500).json({ message: errorMessage });
    }
}
