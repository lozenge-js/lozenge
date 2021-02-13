import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';

export default function (source) {
  const options = getOptions(this);


  // Apply some transformations to the source...

  return `${source};`;
}
