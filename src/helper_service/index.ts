export class HelperService {
  static getMonth(created_at) {
    let date = new Date(created_at);
    let month = '';

    switch (date.getMonth()) {
      case 0:
        month = 'Jan';
        break;
      case 1:
        month = 'Feb';
        break;
      case 2:
        month = 'Mar';
        break;
      case 3:
        month = 'Apr';
        break;
      case 4:
        month = 'May';
        break;
      case 5:
        month = 'June';
        break;
      case 6:
        month = 'July';
        break;
      case 7:
        month = 'Aug';
        break;
      case 8:
        month = 'Sep';
        break;
      case 9:
        month = 'Oct';
        break;
      case 10:
        month = 'Nov';
        break;
      case 11:
        month = 'Dec';
        break;
      default:
        break;
    }

    return month;
  }

  static getJoinedDate(created_at) {
    let date = new Date(created_at);
    let month = this.getMonth(created_at);
    let year = date.getFullYear();
    let day = date.getDate();

    let join_date = `${month} ${day},${year}`;
    return join_date;
  }
}


