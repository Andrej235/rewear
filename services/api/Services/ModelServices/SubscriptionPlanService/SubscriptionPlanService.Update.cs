using FluentResults;
using ReWear.Dtos.Request.SubscriptionPlan;

namespace ReWear.Services.ModelServices.SubscriptionPlanService;

public partial class SubscriptionPlanService
{
    public Task<Result> Update(UpdateSubscriptionPlanRequestDto request)
    {
        var subscriptionPlan = updateMapper.Map(request);
        return updateService.Update(subscriptionPlan);
    }
}
