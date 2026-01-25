namespace ReWear.Dtos.Response.SubscriptionPlan;

public class AdminSubscriptionPlanResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public decimal MonthlyPrice { get; set; }

    public int MaxItemsPerMonth { get; set; }
    public bool AllowsOuterwear { get; set; }
    public bool AllowsShoes { get; set; }

    public int SubscriptionsCount { get; set; }
}
