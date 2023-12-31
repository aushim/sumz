import { useState, useEffect } from "react";

import copy from "../assets/copy.svg";
import linkIcon from "../assets/link.svg";
import loader from "../assets/loader.svg";
import tick from "../assets/tick.svg";
import deleteIcon from "../assets/delete.svg";

import { useLazyGetSummaryQuery } from "../services/article";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });

  const [allArticles, setAllArticles] = useState(
    [] as Array<{ url: string; summary: string }>
  );

  const [copied, setCopied] = useState("");

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = localStorage.getItem("articles");

    if (articlesFromLocalStorage) {
      setAllArticles(JSON.parse(articlesFromLocalStorage));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data } = await getSummary({ articleUrl: article.url });

    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];
      setAllArticles(updatedAllArticles);
      setArticle(newArticle);

      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopy = (copyUrl: string) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(""), 3000);
  };

  const handleDelete = (copyUrl: string) => {
    const updatedAllArticles = allArticles.filter(
      (item) => item.url !== copyUrl
    );
    setAllArticles(updatedAllArticles);
    localStorage.setItem("articles", JSON.stringify(updatedAllArticles));

    if (article.url === copyUrl) {
      setArticle({
        url: "",
        summary: "",
      });
    }
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />

          <input
            type="url"
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e) => {
              setArticle({ ...article, url: e.target.value });
            }}
            required
            className="url_input peer"
          />

          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            ↩
          </button>
        </form>

        {/* Browse URL History */}
        <div>
          {allArticles.slice(0, 5).map((item, index) => (
            <div key={`link-${index}`} className="link_card">
              <div
                className="copy_btn hover:bg-gray-200"
                onClick={() => handleCopy(item.url)}
              >
                <img
                  src={copied === item.url ? tick : copy}
                  alt="copy_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p
                onClick={() => setArticle(item)}
                className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate"
              >
                {item.url}
              </p>
              <div
                className="delete_btn hover:bg-red-300"
                onClick={() => handleDelete(item.url)}
              >
                <img
                  src={deleteIcon}
                  alt="delete_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Display Results */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <br />
            <span className="font-satoshi font-nornal text-gray-500">
              {error && "data" in error
                ? (error?.data as { error: string })?.error.replace(
                    "An error occurred: ",
                    ""
                  )
                : "Please try again in some time"}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
