using FluentResults;
using ReWear.Dtos.Request.InventoryItem;
using ReWear.Dtos.Response.InventoryItem;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Mapping.Request;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.InventoryItemService;

public partial class InventoryItemService(
    ICreateRangeService<InventoryItem> createRangeService,
    IReadSingleSelectedService<ClothingItem> clothingItemReadService,
    IRequestMapper<AddStockRequestDto, IEnumerable<InventoryItem>> addStockRequestMapper
) : IInventoryItemService { }
