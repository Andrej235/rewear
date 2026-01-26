using FluentResults;
using ReWear.Dtos.Request.SubscriptionPlan;
using ReWear.Dtos.Response.SubscriptionPlan;

namespace ReWear.Services.ModelServices.SubscriptionPlanService;

public interface ISubscriptionPlanService
{
    Task<Result<AdminSubscriptionPlanResponseDto>> Create(CreateSubscriptionPlanRequestDto request);

    Task<Result<AdminSubscriptionPlanResponseDto>> GetById(
        int id,
        CancellationToken cancellationToken
    );
    Task<Result<IEnumerable<AdminSubscriptionPlanResponseDto>>> AdminGetAll(
        CancellationToken cancellationToken
    );
    Task<Result<IEnumerable<SubscriptionPlanResponseDto>>> GetAll(
        CancellationToken cancellationToken
    );

    Task<Result> Update(UpdateSubscriptionPlanRequestDto request);

    Task<Result> Delete(int id);
}
