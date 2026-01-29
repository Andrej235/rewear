using Microsoft.AspNetCore.Identity;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.ModelServices.UserStyleEmbeddingService;
using ReWear.Services.Read;
using ReWear.Services.Update;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService(
    UserManager<User> userManager,
    IUserStyleEmbeddingService userStyleEmbeddingService,
    ICreateSingleService<DeliveryBox> createService,
    ICreateSingleService<DeliveryBoxItem> createItemService,
    ICreateRangeService<DeliveryBoxItem> createItemRangeService,
    IReadSingleSelectedService<DeliveryBox> readService,
    IReadRangeService<UserSize> userSizeReadService,
    IReadRangeSelectedService<DeliveryBox> readRangeService,
    IReadRangeSelectedService<InventoryItem> inventoryItemReadService,
    IReadRangeSelectedService<ClothingItem> clothingItemReadService,
    IExecuteUpdateService<DeliveryBoxItem> deliveryBoxItemUpdateService,
    IExecuteUpdateService<InventoryItem> inventoryItemUpdateService,
    IDeleteService<DeliveryBoxItem> deleteItemService
) : IDeliveryBoxService;
