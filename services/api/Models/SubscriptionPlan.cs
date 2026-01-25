namespace ReWear.Models;

public class SubscriptionPlan
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public decimal MonthlyPrice { get; set; }

    public int MaxItemsPerMonth { get; set; }
    public bool AllowsOuterwear { get; set; }
    public bool AllowsShoes { get; set; }

    public ICollection<UserSubscription> Subscriptions { get; set; } = [];
}
