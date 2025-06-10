import type { NextApiRequest } from "next"
import { initSocketServer, type NextApiResponseWithSocket } from "@/lib/socket"

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method === "GET") {
    // Initialize socket server
    const io = initSocketServer(req, res)

    // Send a response to confirm the socket server is running
    res.status(200).json({
      success: true,
      message: "Socket.io server is running",
      socketPath: "/api/socket",
    })
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).json({ error: "Method not allowed" })
  }
}
