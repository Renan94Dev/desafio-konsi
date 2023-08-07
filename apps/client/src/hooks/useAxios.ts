import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";

export function useAxios() {
  const [abortController, setAbortController] = useState<AbortController>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setAbortController(controller);

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  const makeRequest = async (
    options: AxiosRequestConfig
  ): Promise<AxiosResponse> => {
    setLoading(true);
    return axios(options)
      .then((res) => res)
      .finally(() => {
        setLoading(false);
      });
  };

  const cancelRequest = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return { makeRequest, cancelRequest, loading };
}
