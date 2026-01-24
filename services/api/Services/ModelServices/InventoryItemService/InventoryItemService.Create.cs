using FluentResults;
using ReWear.Dtos.Request.InventoryItem;

namespace ReWear.Services.ModelServices.InventoryItemService;

public partial class InventoryItemService
{
    public Task<Result> AddStock(AddStockRequestDto dto)
    {
        var mapped = addStockRequestMapper.Map(dto);
        return createRangeService.Add(mapped);
    }
}
