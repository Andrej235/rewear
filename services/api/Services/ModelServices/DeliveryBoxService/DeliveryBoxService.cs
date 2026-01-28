using Microsoft.AspNetCore.Identity;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService(
    UserManager<User> userManager,
    ICreateSingleService<DeliveryBox> createService,
    IReadSingleSelectedService<DeliveryBox> readService,
    IReadRangeSelectedService<DeliveryBox> readRangeService
) : IDeliveryBoxService;
