import jwt from "jsonwebtoken"

const jwtVerify = (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization ? req.headers.authorization.replace("Bearer ", "") : null
        if(!bearerToken) throw new Error("Authorization failed.");

        jwt.verify(bearerToken, process.env.AUTH_TOKEN)

        next()

    } catch (error) {
        res.status(400).json({
            message: error?.message ?? "Some error occured",
            statusCode: 400,
            success: false
        })
    }
}

export default jwtVerify