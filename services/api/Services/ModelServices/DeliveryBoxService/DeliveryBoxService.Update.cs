using FluentResults;
using ReWear.Models.Enums;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public Task<Result> UpdateStatus(Guid boxId, DeliveryBoxStatus newStatus)
    {
        if (newStatus == DeliveryBoxStatus.None)
            return Task.FromResult(Result.Fail("Invalid status"));

        return deliveryBoxUpdateService.Update(
            x => x.Id == boxId && x.Status != DeliveryBoxStatus.None,
            x => x.SetProperty(x => x.Status, newStatus)
        );
    }
}
