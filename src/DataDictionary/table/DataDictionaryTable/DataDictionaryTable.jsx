import React from 'react';
import PropTypes from 'prop-types';
import './DataDictionaryTable.css';
import { parseDictionaryNodes } from '../../utils';
import DataDictionaryCategory from '../DataDictionaryCategory';

/**
 * Just exported for testing
 * Little helper that extacts a mapping of category-name to
 * the list of nodes in that category given a dictionary definition object
 *
 * @param {Object} dictionary
 * @return {} mapping from category to node list
 */
/* eslint-disable no-param-reassign */
export function category2NodeList(dictionary) {
  /* helpers for the helper */
  const idFilter = (id) => id.charAt(0) !== '_' && id === dictionary[id].id;

  const categoryFilter = (node) => node.category && node.id && node.category.toLowerCase() !== 'internal';

  const res = Object.keys(dictionary).filter(
    (id) => idFilter(id),
  ).map(
    (id) => dictionary[id],
  ).filter(
    (node) => categoryFilter(node),
  )
    .reduce(
      (lookup, node) => {
        if (!lookup[node.category]) {
          lookup[node.category] = [];
        }
        lookup[node.category].push(node);
        return lookup;
      }, {},
    );
  return res;
}
/* eslint-enable no-param-reassign */

const getNodePropertyCount = (dictionary) => {
  const res = parseDictionaryNodes(dictionary)
    .reduce((acc, node) => {
      acc.nodesCount += 1;
      acc.propertiesCount += Object.keys(node.properties).length;
      return acc;
    }, {
      nodesCount: 0,
      propertiesCount: 0,
    });
  return {
    nodesCount: res.nodesCount,
    propertiesCount: res.propertiesCount,
  };
};

/**
 * Little components presents an overview of the types in a dictionary organized by category
 *
 * @param {dictionary} params
 */
const DataDictionaryTable = ({
  dictionary, highlightingNodeID, onExpandNode, dictionaryName,
}) => {
  const c2nl = category2NodeList(dictionary);
  const { nodesCount, propertiesCount } = getNodePropertyCount(dictionary);
  return (
    <React.Fragment>
      <p>
      <span>
          <b>Partners:</b>
          Download the Case JSON or TSV template and enter your specimen information.<br />
          Once all fields are completed, click on the Submit button to upload your file.<br />
          RIPHL IDs will be provided once all cases are uploaded.<br />
          Alternatively, you can enter each sample using the webform found on the Submit page.<br />
        </span>
        <span>
          <b>CDPH staff:</b>
          Download the CDPH JSON or TSV template and enter your specimen information.<br />
          Once all fields are completed, click on the Submit button to upload your file.<br />
        </span>
        <span>
          <b>RIPHL staff:</b>
          Download the LAB JSON or TSV template and enter your specimen information.<br />
          Once all fields are completed, click on the Submit button to upload your file.<br />
        </span>
      </p>
      {Object.keys(c2nl).map((category) => (
        <DataDictionaryCategory
          key={category}
          nodes={c2nl[category]}
          category={category}
          highlightingNodeID={highlightingNodeID}
          onExpandNode={onExpandNode}
        />
      ))}
    </React.Fragment>
  );
};

DataDictionaryTable.propTypes = {
  dictionary: PropTypes.object,
  highlightingNodeID: PropTypes.string,
  onExpandNode: PropTypes.func,
  dictionaryName: PropTypes.string,
};

DataDictionaryTable.defaultProps = {
  dictionary: {},
  highlightingNodeID: null,
  onExpandNode: () => {},
  dictionaryName: '',
};

export default DataDictionaryTable;
