export const getIdentityCandidates = (user) => {
    const values = [user?._id?.toString(), user?.clerkId].filter(Boolean);
    return [...new Set(values)];
};
