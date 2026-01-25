using Microsoft.EntityFrameworkCore;

namespace ReWear.Utilities
{
    public static class EnumerableExtensions
    {
        public static Task<List<T>> ApplyOffsetAndLimit<T>(
            this IQueryable<T> queryable,
            int? offset = 0,
            int? limit = -1,
            CancellationToken cancellationToken = default
        )
        {
            queryable = queryable.Skip(offset ?? 0);

            if (limit is >= 0)
                queryable = queryable.Take(limit ?? 0);

            return queryable.ToListAsync(cancellationToken: cancellationToken);
        }

        public static string JoinWithCommasAndAnd(this IEnumerable<string> items)
        {
            var itemList = items.ToList();
            if (itemList.Count == 0)
                return string.Empty;
            if (itemList.Count == 1)
                return itemList[0];
            if (itemList.Count == 2)
                return $"{itemList[0]} and {itemList[1]}";

            var allButLast = itemList.Take(itemList.Count - 1);
            var lastItem = itemList.Last();
            return $"{string.Join(", ", allButLast)}, and {lastItem}";
        }
    }
}
