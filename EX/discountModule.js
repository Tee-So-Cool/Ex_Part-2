const fs = require('fs'); // Use the correct Node.js module for file reading

const applyFixedAmountDiscount = (total, amount) => {
    return total - amount;
};

const applyPercentageDiscount = (total, percentage) => {
    return total - (total * (percentage / 100));
};

const applyCategoryPercentageDiscount = (cart, category, percentage) => {
    return cart.reduce((acc, item) => {
        if (item.category === category) {
            acc.discount += item.price * (percentage / 100);
        }
        acc.total += item.price;
        return acc;
    }, { total: 0, discount: 0 });
};

const applyPointsDiscount = (total, points) => {
    const maxPointsDiscount = total * 0.2;
    return total - Math.min(points, maxPointsDiscount);
};

const applySeasonalDiscount = (total, every, discount) => {
    const eligibleChunks = Math.floor(total / every);
    return total - (eligibleChunks * discount);
};

// Main Function
function calculateFinalPrice(input) {
    let { cart, campaigns } = input;

    // Calculate Total
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    let appliedDiscounts = [];

    // Apply Coupon
    const coupon = campaigns.find(c => c.type === "FixedAmount") ||
        campaigns.find(c => c.type === "Percentage");
    if (coupon) {
        if (coupon.type === "FixedAmount") {
            total = applyFixedAmountDiscount(total, coupon.amount);
            appliedDiscounts.push(`Fixed Amount Discount: -${coupon.amount} THB`);
        } else if (coupon.type === "Percentage") {
            const discount = total * (coupon.percentage / 100);
            total = applyPercentageDiscount(total, coupon.percentage);
            appliedDiscounts.push(`Percentage Discount: -${discount.toFixed(2)} THB`);
        }
    }

    // Apply On Top Discounts
    const categoryDiscount = campaigns.find(c => c.type === "CategoryPercentage");
    if (categoryDiscount) {
        const { total: subTotal, discount } = applyCategoryPercentageDiscount(
            cart,
            categoryDiscount.category,
            categoryDiscount.percentage
        );
        total -= discount;
        appliedDiscounts.push(`Category Discount (${categoryDiscount.category}): -${discount.toFixed(2)} THB`);
    }

    const pointsDiscount = campaigns.find(c => c.type === "Points");
    if (pointsDiscount) {
        const discount = Math.min(pointsDiscount.points, total * 0.2);
        total = applyPointsDiscount(total, pointsDiscount.points);
        appliedDiscounts.push(`Points Discount: -${discount.toFixed(2)} THB`);
    }

    // Apply Seasonal Discounts
    const seasonal = campaigns.find(c => c.type === "Seasonal");
    if (seasonal) {
        const discount = Math.floor(total / seasonal.every) * seasonal.discount;
        total = applySeasonalDiscount(total, seasonal.every, seasonal.discount);
        appliedDiscounts.push(`Seasonal Discount: -${discount.toFixed(2)} THB`);
    }

    return {
        finalPrice: total.toFixed(2),
        appliedDiscounts
    };
}

// Read input.json
const input = JSON.parse(fs.readFileSync('input.json', 'utf8'));

// Call the function
const result = calculateFinalPrice(input);
console.log("Final Price:", result.finalPrice);
console.log("Applied Discounts:", result.appliedDiscounts);
