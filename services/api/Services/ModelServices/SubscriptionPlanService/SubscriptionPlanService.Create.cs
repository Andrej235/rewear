using FluentResults;
using ReWear.Dtos.Request.SubscriptionPlan;
using ReWear.Dtos.Response.SubscriptionPlan;

namespace ReWear.Services.ModelServices.SubscriptionPlanService;

public partial class SubscriptionPlanService
{
    public async Task<Result<AdminSubscriptionPlanResponseDto>> Create(
        CreateSubscriptionPlanRequestDto request
    )
    {
        var newSubscriptionPlan = createMapper.Map(request);
        var result = await createService.Add(newSubscriptionPlan);

        if (result.IsFailed)
            return Result.Fail(result.Errors);

        return new AdminSubscriptionPlanResponseDto
        {
            Id = result.Value.Id,
            Name = result.Value.Name,
            AllowsOuterwear = result.Value.AllowsOuterwear,
            AllowsShoes = result.Value.AllowsShoes,
            MaxItemsPerMonth = result.Value.MaxItemsPerMonth,
            MonthlyPrice = result.Value.MonthlyPrice,
            SubscriptionsCount = 0,
        };
    }
}
