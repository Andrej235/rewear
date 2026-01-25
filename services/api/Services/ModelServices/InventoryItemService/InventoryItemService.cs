using FluentResults;
using ReWear.Dtos.Request.InventoryItem;
using ReWear.Dtos.Response.InventoryItem;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.Mapping.Request;
using ReWear.Services.Read;
using ReWear.Services.Update;

namespace ReWear.Services.ModelServices.InventoryItemService;

public partial class InventoryItemService(
    ICreateRangeService<InventoryItem> createRangeService,
    IReadSingleSelectedService<ClothingItem> clothingItemReadService,
    IExecuteUpdateService<InventoryItem> updateService,
    IDeleteService<InventoryItem> deleteService,
    IRequestMapper<AddStockRequestDto, IEnumerable<InventoryItem>> addStockRequestMapper
) : IInventoryItemService;
