import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import intlFormatDistance from "date-fns/intlFormatDistance";
import React from "react";

import { API } from "aws-amplify";
import { graphqlOperation } from "aws-amplify";
import * as mutations from "./graphql/mutations";
import * as queries from "./graphql/queries";
import * as subscriptions from "./graphql/subscriptions";

function App({ user, signOut }) {
  const [chats, setChats] = React.useState([]);


  React.useEffect(() => {
    async function fetchChats() {
      const allChats = await API.graphql({
        query: queries.listChats,
      });
      console.log(allChats.data.listChats.items);
      setChats(allChats.data.listChats.items);
    }
    fetchChats();
  }, []);

  React.useEffect(() => {
    const sub = API.graphql(
      graphqlOperation(subscriptions.onCreateChat)
    ).subscribe({
      next: ({ provider, value }) =>
        setChats((prev) => [...prev, value.data.onCreateChat]),
      error: (err) => console.log(err),
    });
    return () => sub.unsubscribe();
  }, []);

  {console.log(user)}

  return (
    <div>
      <div className="flex justify-end px-4 py-2">
        <div>hello {user.attributes.email}</div>
        <button
          type="button"
          className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
      <div className="flex justify-center items-center h-screen w-full">
        <div className={`w-3/4 flex flex-col`}>
      
          {chats
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .map((chat) => (
              <div
                key={chat.id}
                className={`flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200 w-3/4 my-2 ${
                  chat.email === user.attributes.email && "self-end bg-gray-200"
                }`}
              >
                <div>
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-gray-500">
                      <span className="font-medium text-gray-900">
                        {chat.email.split("@")[0]}
                      </span>{" "}
                    </div>
                    <time
                      dateTime="2023-01-23T15:56"
                      className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                    >
                      {intlFormatDistance(new Date(chat.createdAt), new Date())}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-gray-500">{chat.chat} {console.log(chat)}</p>
                </div>
              </div>
            ))}
          <div>
            <div className="relative mt-2 flex items-center">
              <input
                type="text"
                name="search"
                id="search"
                onKeyUp={async (e) => {
                  if (e.key === "Enter") {
                    await API.graphql({
                      query: mutations.createChat,
                      variables: {
                        input: {
                          chat: e.target.value,
                          email: user.attributes.email,
                        },
                      },
                    });
                    e.target.value = "";
                  }
                }}
                className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
                  Enter
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
