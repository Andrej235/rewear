using Microsoft.AspNetCore.Identity;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.Read;
using ReWear.Services.Update;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService(
    UserManager<User> userManager,
    ICreateSingleService<DeliveryBox> createService,
    ICreateSingleService<DeliveryBoxItem> createItemService,
    IReadSingleSelectedService<DeliveryBox> readService,
    IReadRangeSelectedService<DeliveryBox> readRangeService,
    IReadRangeSelectedService<InventoryItem> inventoryItemReadService,
    IExecuteUpdateService<InventoryItem> inventoryItemUpdateService,
    IDeleteService<DeliveryBoxItem> deleteItemService
) : IDeliveryBoxService;
