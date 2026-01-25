using FluentResults;
using ReWear.Dtos.Response.SubscriptionPlan;

namespace ReWear.Services.ModelServices.SubscriptionPlanService;

public partial class SubscriptionPlanService
{
    public Task<Result<AdminSubscriptionPlanResponseDto>> GetById(
        int id,
        CancellationToken cancellationToken
    )
    {
        return readService.Get(
            x => new AdminSubscriptionPlanResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                AllowsOuterwear = x.AllowsOuterwear,
                AllowsShoes = x.AllowsShoes,
                MaxItemsPerMonth = x.MaxItemsPerMonth,
                MonthlyPrice = x.MonthlyPrice,
                SubscriptionsCount = x.Subscriptions.Count,
            },
            x => x.Id == id,
            null,
            cancellationToken
        );
    }

    public Task<Result<IEnumerable<AdminSubscriptionPlanResponseDto>>> GetAll(
        CancellationToken cancellationToken
    )
    {
        return readRangeService.Get(
            x => new AdminSubscriptionPlanResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                AllowsOuterwear = x.AllowsOuterwear,
                AllowsShoes = x.AllowsShoes,
                MaxItemsPerMonth = x.MaxItemsPerMonth,
                MonthlyPrice = x.MonthlyPrice,
                SubscriptionsCount = x.Subscriptions.Count,
            },
            null,
            cancellationToken: cancellationToken
        );
    }
}
