using Microsoft.AspNetCore.Identity;
using ReWear.Dtos.Request.ClothingItem;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.Mapping.Request;
using ReWear.Services.ModelServices.ClothingItemEmbeddingService;
using ReWear.Services.Read;
using ReWear.Services.Storage;
using ReWear.Services.Update;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService(
    IClothingItemEmbeddingService embeddingService,
    UserManager<User> userManager,
    IStorageService storageService,
    ICreateSingleService<ClothingItem> createService,
    IReadSingleSelectedService<ClothingItem> readService,
    IReadRangeSelectedService<ClothingItem> readRangeService,
    IReadRangeService<UserSize> userSizeReadService,
    IUpdateSingleService<ClothingItem> updateSingleService,
    IExecuteUpdateService<ClothingItem> updateService,
    IDeleteService<ClothingItem> deleteService,
    IRequestMapper<CreateClothingItemRequestDto, ClothingItem> createMapper,
    IRequestMapper<UpdateClothingItemRequestDto, ClothingItem> updateMapper
) : IClothingItemService;
