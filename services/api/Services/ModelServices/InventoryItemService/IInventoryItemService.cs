using FluentResults;
using ReWear.Dtos.Request.InventoryItem;
using ReWear.Dtos.Response.InventoryItem;

namespace ReWear.Services.ModelServices.InventoryItemService;

public interface IInventoryItemService
{
    Task<Result> AddStock(AddStockRequestDto dto);

    Task<Result<AdminStockResponseDto>> GetFor(
        Guid clothingItemId,
        CancellationToken cancellationToken
    );

    Task<Result> ChangeSize(ChangeSizeRequestDto dto);
    Task<Result> ChangeCondition(ChangeConditionRequestDto dto);
    Task<Result> ChangeStatus(ChangeStatusRequestDto dto);

    Task<Result> Delete(Guid inventoryItemId);
}
