using FluentResults;
using ReWear.Dtos.Request.SubscriptionPlan;
using ReWear.Dtos.Response.SubscriptionPlan;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.Mapping.Request;
using ReWear.Services.Read;
using ReWear.Services.Update;

namespace ReWear.Services.ModelServices.SubscriptionPlanService;

public partial class SubscriptionPlanService(
    ICreateSingleService<SubscriptionPlan> createService,
    IReadSingleSelectedService<SubscriptionPlan> readService,
    IReadRangeSelectedService<SubscriptionPlan> readRangeService,
    IUpdateSingleService<SubscriptionPlan> updateService,
    IDeleteService<SubscriptionPlan> deleteService,
    IRequestMapper<CreateSubscriptionPlanRequestDto, SubscriptionPlan> createMapper,
    IRequestMapper<UpdateSubscriptionPlanRequestDto, SubscriptionPlan> updateMapper
) : ISubscriptionPlanService;
