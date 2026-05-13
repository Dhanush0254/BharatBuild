import { useQuery } from '@tanstack/react-query';
import { searchListings, getListingDetails, getFeaturedListings, getMarketplaceStats, getMyListings } from '../api/listingsApi';

export const useSearchListings = (searchParams) => {
  const paramsObj = searchParams instanceof URLSearchParams
    ? Object.fromEntries(searchParams.entries())
    : searchParams;

  return useQuery({
    queryKey: ['listings', 'search', paramsObj],
    queryFn: () => searchListings(searchParams),
    placeholderData: (prev) => prev,
  });
};

export const useListingDetails = (id) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingDetails(id),
    enabled: !!id,
  });
};

export const useFeaturedListings = () => {
  return useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: getFeaturedListings,
  });
};

export const useMarketplaceStats = () => {
  return useQuery({
    queryKey: ['listings', 'stats'],
    queryFn: getMarketplaceStats,
  });
};

export const useMyListings = (params) => {
  return useQuery({
    queryKey: ['listings', 'my', params],
    queryFn: () => getMyListings(params),
  });
};
