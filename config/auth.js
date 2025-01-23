module.exports = {
    secret: process.env.AUTH_SECRET ||  "innovation",
    expires:  process.env.AUTH_EXPIRES ||"30d",
    rounds:  process.env.AUTH_ROUNDS ||10
} 