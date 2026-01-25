using ReWear.Dtos.Request.SubscriptionPlan;
using ReWear.Models;

namespace ReWear.Services.Mapping.Request.SubscriptionPlanMappers;

public class CreateSubscriptionPlanRequestMapper
    : IRequestMapper<CreateSubscriptionPlanRequestDto, SubscriptionPlan>
{
    public SubscriptionPlan Map(CreateSubscriptionPlanRequestDto from)
    {
        return new SubscriptionPlan
        {
            Name = from.Name,
            MonthlyPrice = from.MonthlyPrice,
            MaxItemsPerMonth = from.MaxItemsPerMonth,
            AllowsOuterwear = from.AllowsOuterwear,
            AllowsShoes = from.AllowsShoes,
            Subscriptions = [],
        };
    }
}
