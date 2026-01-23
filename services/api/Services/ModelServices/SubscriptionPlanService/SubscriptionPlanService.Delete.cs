using FluentResults;

namespace ReWear.Services.ModelServices.SubscriptionPlanService;

public partial class SubscriptionPlanService
{
    public Task<Result> Delete(int id) => deleteService.Delete(x => x.Id == id);
}
