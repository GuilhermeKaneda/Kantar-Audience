import { api } from "@/lib/api";

export async function getAvgRatingAndShare(filters) {
  const { data } = await api.get("/audience/avgratingandshare", {
    params: filters,
  });

  return data;
}

export async function getAvgRatingAndSharePerDay(filters) {
  const { data } = await api.get("/audience/avgratingandshareperday", {
    params: filters,
  });

  return data;
}

export async function getAvgRatingAndSharePerTimeSlot(filters) {
  const { data } = await api.get("/audience/avgratingandsharepertimeslot", {
    params: filters,
  });

  return data;
}

export async function getAvgRatingAndSharePerWeekDay(filters) {
  const { data } = await api.get("/audience/avgratingandshareperweekday", {
    params: filters,
  });

  return data;
}

export async function getAvgRatingAndSharePerTarget(filters) {
  const { data } = await api.get("/audience/avgratingandsharepertarget", {
    params: filters,
  });

  return data;
}

export async function getDistinctMarkets() {
  const { data } = await api.get("/audience/market");

  return data;
}

export async function getDistinctBroadcasters() {
  const { data } = await api.get("/audience/broadcaster");

  return data;
}

export async function getDistinctWeekDays() {
  const { data } = await api.get("/audience/weekday");

  return data;
}