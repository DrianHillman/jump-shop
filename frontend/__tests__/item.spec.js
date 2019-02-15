import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 5000,
  description: 'This item is reall cool!',
  image: 'dog.jpg',
  largeImage: 'large-dog.jpg',
};

describe('<Item />', () => {
  it('should render the price tag and title properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const PriceTag = wrapper.find('PriceTag');
    const Title = wrapper.find('Title a');

    // console.log(wrapper.debug());
    // console.log(PriceTag.children().debug);

    expect(PriceTag.children().text()).toBe('$50');
    expect(Title.text()).toBe(fakeItem.title);
  });

  it('should render the image properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const img = wrapper.find('img');

    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  it('should render the buttons properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const buttonList = wrapper.find('.buttonList');

    console.log(wrapper.debug());

    expect(buttonList.children()).toHaveLength(3);
    expect(buttonList.find('Link').exists()).toBe(true);
    expect(buttonList.find('AddToCart').exists()).toBe(true);
    expect(buttonList.find('DeleteButton').exists()).toBe(true);
  });
});
