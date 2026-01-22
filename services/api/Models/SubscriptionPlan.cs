namespace ReWear.Models;

public class SubscriptionPlan
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public decimal MonthlyPrice { get; set; }

    public int MaxItemsPerMonth { get; set; }
    public bool AllowsOuterwear { get; set; }
    public bool AllowsShoes { get; set; }
}
