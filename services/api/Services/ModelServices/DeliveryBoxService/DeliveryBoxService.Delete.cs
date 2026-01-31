using FluentResults;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public Task<Result> AdminDelete(Guid boxId)
    {
        return deleteService.Delete(x => x.Id == boxId);
    }
}
