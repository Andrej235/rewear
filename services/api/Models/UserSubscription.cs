namespace ReWear.Models;

public class UserSubscription
{
    public User User { get; set; } = null!;
    public string UserId { get; set; } = null!;

    public SubscriptionPlan SubscriptionPlan { get; set; } = null!;
    public int SubscriptionPlanId { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime NextRenewalDate { get; set; }
    public bool IsActive { get; set; }
}
