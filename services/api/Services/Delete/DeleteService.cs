using System.Linq.Expressions;
using FluentResults;
using Microsoft.EntityFrameworkCore;
using Template.Data;
using Template.Errors;

namespace Template.Services.Delete
{
    public class DeleteService<T>(DataContext context) : IDeleteService<T>
        where T : class
    {
        public async Task<Result> Delete(
            Expression<Func<T, bool>> deleteCriteria,
            bool validate = true
        )
        {
            int deletedCount = await context.Set<T>().Where(deleteCriteria).ExecuteDeleteAsync();
            if (validate && deletedCount == 0)
                return Result.Fail(new NotFound("Entity not found"));

            return Result.Ok();
        }
    }
}
