const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log("Authorization header:", authHeader);

    if (!authHeader) return res.status(401).json({ message: "Not authorized - token missing!" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Not authorized - invalid token format!" });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, admin_name) => {
        if (err) {
            console.log("Ogiltig JWT: ", err);
            return res.status(403).json({ message: "Invalid JWT" });
        }
        req.admin_name = admin_name;
        next();
    });
}

module.exports = { authenticateToken };

