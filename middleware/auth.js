const jwt = require('jsonwebtoken');

const config = process.env;

const verifyToken = (req, res, next ) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token']

    if(!token) {
        return res.status(403).send("A token is required for authentication")
    }

    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;

        approve = decoded.approve;

        // if ( approve == true ) {
        //     return next();
        // } else {
        //     return res.status(403).send({
        //         status: "403",
        //         message: "Waiting to approve"
        //     })
        // }

        return next();

    } catch {
        return res.status(401).send("Invalid Token");
    }

}

module.exports = verifyToken;