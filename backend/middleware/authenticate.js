import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "rrid-auth-service",
      audience: "rrid-web-api",
    });
    req.auth = { userId: claims.sub, role: claims.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired credentials." });
  }
}
