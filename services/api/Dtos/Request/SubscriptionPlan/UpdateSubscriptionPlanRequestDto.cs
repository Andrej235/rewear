namespace ReWear.Dtos.Request.SubscriptionPlan;

public class UpdateSubscriptionPlanRequestDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public decimal MonthlyPrice { get; set; }

    public int MaxItemsPerMonth { get; set; }
    public bool AllowsOuterwear { get; set; }
    public bool AllowsShoes { get; set; }
}
