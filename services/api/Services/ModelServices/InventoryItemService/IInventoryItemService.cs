using FluentResults;
using ReWear.Dtos.Request.InventoryItem;
using ReWear.Dtos.Response.InventoryItem;

namespace ReWear.Services.ModelServices.InventoryItemService;

public interface IInventoryItemService
{
    Task<Result> AddStock(AddStockRequestDto dto);

    Task<Result<IEnumerable<AdminInventoryItemResponseDto>>> GetFor(
        Guid clothingItemId,
        CancellationToken cancellationToken
    );
}
