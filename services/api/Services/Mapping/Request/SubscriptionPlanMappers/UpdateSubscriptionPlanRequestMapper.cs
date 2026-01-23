using ReWear.Dtos.Request.SubscriptionPlan;
using ReWear.Models;

namespace ReWear.Services.Mapping.Request.SubscriptionPlanMappers;

public class UpdateSubscriptionPlanRequestMapper
    : IRequestMapper<UpdateSubscriptionPlanRequestDto, SubscriptionPlan>
{
    public SubscriptionPlan Map(UpdateSubscriptionPlanRequestDto from)
    {
        return new SubscriptionPlan
        {
            Id = from.Id,
            Name = from.Name,
            MonthlyPrice = from.MonthlyPrice,
            MaxItemsPerMonth = from.MaxItemsPerMonth,
            AllowsOuterwear = from.AllowsOuterwear,
            AllowsShoes = from.AllowsShoes,
            Subscriptions = [],
        };
    }
}
