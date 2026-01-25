using FluentResults;
using ReWear.Dtos.Request.InventoryItem;

namespace ReWear.Services.ModelServices.InventoryItemService;

public partial class InventoryItemService
{
    public Task<Result> ChangeCondition(ChangeConditionRequestDto dto)
    {
        return updateService.Update(
            x => x.Id == dto.InventoryItemId,
            x => x.SetProperty(y => y.Condition, dto.NewCondition)
        );
    }

    public Task<Result> ChangeSize(ChangeSizeRequestDto dto)
    {
        return updateService.Update(
            x => x.Id == dto.InventoryItemId,
            x =>
                x.SetProperty(y => y.TopSize, dto.TopSize)
                    .SetProperty(y => y.BottomWaistSize, dto.BottomWaistSize)
                    .SetProperty(y => y.BottomLengthSize, dto.BottomLengthSize)
                    .SetProperty(y => y.ShoeSize, dto.ShoeSize)
        );
    }

    public Task<Result> ChangeStatus(ChangeStatusRequestDto dto)
    {
        return updateService.Update(
            x => x.Id == dto.InventoryItemId,
            x => x.SetProperty(y => y.Status, dto.NewStatus)
        );
    }
}
