
export default class LoadingGroup {
  constructor(type) {
    this.type = type;
    this.fetchesInProgress = 0;
    this.isLoading = false;
  }

  getLoading = () => {
    this.isLoading = this.fetchesInProgress > 0;
    return this.isLoading;
  }

  startFetch = () => {
    this.fetchesInProgress += 1;
    return this.getLoading();
  }

  completeFetch = () => {
    if (this.fetchesInProgress === 0) {
      return this.getLoading();
    }
    this.fetchesInProgress -= 1;
    return this.getLoading();
  };
}
