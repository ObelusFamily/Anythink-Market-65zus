import ItemMeta from "./ItemMeta";
import CommentContainer from "./CommentContainer";
import React from "react";
import agent from "../../agent";
import { connect } from "react-redux";
import marked from "marked";
import {
  ITEM_PAGE_LOADED,
  ITEM_PAGE_UNLOADED,
} from "../../constants/actionTypes";
import placholderImg from '../../imgs/placeholder.png';

const mapStateToProps = (state) => ({
  ...state.item,
  currentUser: state.common.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  onLoad: (payload) => dispatch({ type: ITEM_PAGE_LOADED, payload }),
  onUnload: () => dispatch({ type: ITEM_PAGE_UNLOADED }),
});

class Item extends React.Component {
  async componentDidMount() {
    const item = await agent.Items.get(this.props.match.params.id);
    const comments = await agent.Comments.forItem(this.props.match.params.id);
    this.props.onLoad([item, comments]);
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const {currentUser,item, comments, commentErrors, match}=this.props;
    if (!item) {
      return null;
    }

    const markup = {
      __html: marked(item.description, { sanitize: true }),
    };
    
    const canModify =
      currentUser &&
      currentUser.username === item.seller.username;
    return (
      <div className="container page" id="item-container">
        <div className="text-dark">
          <div className="row bg-white p-4">
            <div className="col-6">
              <img
                src={item.image && item.image !== ''?item.image:placholderImg}
                alt={item.title}
                className="item-img"
                style={{ height: "500px", width: "100%", borderRadius: "6px" }}
              />
            </div>

            <div className="col-6">
              <h1 id="card-title">{item.title}</h1>
              <ItemMeta item={item} canModify={canModify} />
              <div dangerouslySetInnerHTML={markup}></div>
              {item.tagList.map((tag) => {
                return (
                  <span className="badge badge-secondary p-2 mx-1" key={tag}>
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="row bg-light-gray p-4">
            <CommentContainer
              comments={comments || []}
              errors={commentErrors}
              slug={match.params.id}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Item);
