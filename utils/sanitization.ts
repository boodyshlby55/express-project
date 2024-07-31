export const sanitizeUser = function (user: any) {
    return {
        _id: user._id,
        name: user?.name,
        email: user?.email,
        image: user?.image,
        active: user?.active,
    };
};