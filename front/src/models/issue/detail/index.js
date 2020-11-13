import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  IssueDetailHeader,
  IssueDetailBody,
  IssueDetailFooter,
} from '../../../components/issue/detail';

import SidebarLayout from '../../../components/commons/SidebarLayout';
import Sidebar from '../../sidebar';
import { userContext } from '../../../contexts/user';
import IssueEditHeader from '../../../components/issue/edit/header';
import issueAPI from '../../../apis/issue';
import commentAPI from '../../../apis/comment';
import utils from '../../../libs/utils';
import { useAsync } from '../../../hooks/useAsync';
import useSidebar from '../../../hooks/useSidebar';
import reducer from './reducer';
import actions from './actions';

const initialState = {
  issue: {},
  newTitle: '',
  newContents: '',
  countOfComments: undefined,
  showEditIssueHeader: false,
  showEditIssueDetail: false,
};

const IssueDetailPage = () => {
  const { id } = useParams();
  const getIssueApi = () => issueAPI.getIssue(id);
  const { state: seletedState, handlers } = useSidebar();
  const { state: detailState, fetchStatus, dispatch } = useAsync({
    api: getIssueApi,
    reducer,
    initialState,
  });
  const [commentInput, setCommentInput] = useState('');
  const {
    state: { profileLink },
  } = useContext(userContext);

  const {
    issue,
    showEditIssueHeader,
    showEditIssueDetail,
    countOfComments,
  } = detailState;
  const { error, loading } = fetchStatus;

  const editTitleClickHandler = () => {
    dispatch(actions.updateOneState('showEditIssueHeader', true));
  };
  const cancelTitleClickHandler = () => {
    dispatch(actions.updateOneState('showEditIssueHeader', false));
  };
  const editContentsClickHandler = () => {
    dispatch(actions.updateOneState('showEditIssueDetail', true));
  };
  const cancelContentsClickHandler = () => {
    dispatch(actions.updateOneState('showEditIssueDetail', false));
  };

  const updateTitle = (newTitle) => {
    dispatch(actions.updateOneState('newTitle', newTitle));
  };

  const updateContents = (newContents) => {
    dispatch(actions.updateOneState('newContents', newContents));
  };

  const onTitleSave = async () => {
    const {
      issue: { id: issueId },
      newTitle,
    } = detailState;
    if (!newTitle.length) return false;
    try {
      await issueAPI.updateTitle({ id: issueId, title: newTitle });
      dispatch(actions.successUpdateTitle());
      return true;
    } catch (updateError) {
      return <div>{updateError}</div>;
    }
  };

  const registerComment = async () => {
    const payload = {
      issueId: issue.id,
      contents: commentInput,
    };
    const newComment = await commentAPI.registerComment(payload);
    dispatch(actions.updateComment(newComment));
    setCommentInput('');
  };

  const onContentsSave = async () => {
    const {
      issue: { id: issueId },
      newContents,
    } = detailState;
    try {
      await issueAPI.updateContents({ id: issueId, contents: newContents });
      dispatch(actions.successUpdateContents());
      return true;
    } catch (updateContentsError) {
      return <div>{updateContentsError}</div>;
    }
  };

  const changeStatus = async () => {
    const { isClosed, closedAt } = await issueAPI.changeStatus(issue.id);
    dispatch(actions.updateClosedStatus(isClosed, closedAt));
  };

  if (error) {
    return <div>{error}</div>;
  }
  if (loading) {
    return null;
  }

  return (
    !utils.isEmpty(issue) && (
      <>
        <SidebarLayout.BaseLayout>
          <SidebarLayout.Content>
            <>
              {showEditIssueHeader ? (
                <IssueEditHeader
                  issue={issue}
                  updateTitle={updateTitle}
                  onTitleSave={onTitleSave}
                  cancelTitleClickHandler={cancelTitleClickHandler}
                  countOfComments={countOfComments}
                />
              ) : (
                <IssueDetailHeader
                  countOfComments={countOfComments}
                  issue={issue}
                  editTitleClickHandler={editTitleClickHandler}
                />
              )}
              <IssueDetailBody
                issue={issue}
                showEditIssueDetail={showEditIssueDetail}
                onChange={updateContents}
                onContentsSave={onContentsSave}
                editContentsClickHandler={editContentsClickHandler}
                cancelContentsClickHandler={cancelContentsClickHandler}
              />
              <IssueDetailFooter
                inputState={commentInput}
                isClosed={issue.isClosed}
                profileLink={profileLink}
                onInputComment={setCommentInput}
                onReopenIssue={changeStatus}
                onCloseIssue={changeStatus}
                onCommentSubmit={registerComment}
              />
            </>
          </SidebarLayout.Content>
          <SidebarLayout.Sidebar>
            <Sidebar selected={seletedState} handlers={handlers} />
          </SidebarLayout.Sidebar>
        </SidebarLayout.BaseLayout>
      </>
    )
  );
};

export default IssueDetailPage;
