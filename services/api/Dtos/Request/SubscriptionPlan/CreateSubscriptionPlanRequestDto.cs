namespace ReWear.Dtos.Request.SubscriptionPlan;

public class CreateSubscriptionPlanRequestDto
{
    public string Name { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }

    public int MaxItemsPerMonth { get; set; }
    public bool AllowsOuterwear { get; set; }
    public bool AllowsShoes { get; set; }
}
