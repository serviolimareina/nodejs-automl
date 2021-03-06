// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Note: this file is purely for documentation. Any contents are not expected
// to be loaded as the JS file.

/**
 * Input configuration for ImportData Action.
 *
 * The format of input depends on dataset_metadata the Dataset into which
 * the import is happening has. As input source the
 * gcs_source
 * is expected, unless specified otherwise. If a file with identical content
 * (even if it had different GCS_FILE_PATH) is mentioned multiple times , then
 * its label, bounding boxes etc. are appended. The same file should be always
 * provided with the same ML_USE and GCS_FILE_PATH, if it is not then
 * these values are nondeterministically selected from the given ones.
 *
 * The formats are represented in EBNF with commas being literal and with
 * non-terminal symbols defined near the end of this comment. The formats are:
 *
 *  *  For Image Object Detection:
 *         CSV file(s) with each line in format:
 *           ML_USE,GCS_FILE_PATH,LABEL,BOUNDING_BOX
 *           GCS_FILE_PATH leads to image of up to 30MB in size. Supported
 *           extensions: .JPEG, .GIF, .PNG.
 *           Each image is assumed to be exhaustively labeled. The
 *           minimum allowed BOUNDING_BOX edge length is 0.01, and no more than
 *           500 BOUNDING_BOX-es per image are allowed.
 *         Three sample rows:
 *           TRAIN,gs://folder/image1.png,car,0.1,0.1,,,0.3,0.3,,
 *           TRAIN,gs://folder/image1.png,bike,.7,.6,,,.8,.9,,
 *           TEST,gs://folder/im2.png,car,0.1,0.1,0.2,0.1,0.2,0.3,0.1,0.3
 *
 *
 *  *  For Video Classification:
 *         CSV file(s) with each line in format:
 *           ML_USE,GCS_FILE_PATH
 *           where ML_USE VALIDATE value should not be used. The GCS_FILE_PATH
 *           should lead to another .csv file which describes examples that have
 *           given ML_USE, using the following row format:
 *           GCS_FILE_PATH,LABEL,TIME_SEGMENT_START,TIME_SEGMENT_END
 *           Here GCS_FILE_PATH leads to a video of up to 50GB in size and up
 *           to 3h duration. Supported extensions: .MOV, .MPEG4, .MP4, .AVI.
 *           TIME_SEGMENT_START and TIME_SEGMENT_END must be within the
 *           length of the video, and end has to be after the start. Any segment
 *           of a video which has one or more labels on it, is considered a
 *           hard negative for all other labels. Any segment with no labels on
 *           it is considered to be unknown.
 *         Sample top level CSV file:
 *           TRAIN,gs://folder/train_videos.csv
 *           TEST,gs://folder/test_videos.csv
 *           UNASSIGNED,gs://folder/other_videos.csv
 *         Three sample rows of a CSV file for a particular ML_USE:
 *           gs://folder/video1.avi,car,120,180.000021
 *           gs://folder/video1.avi,bike,150,180.000021
 *           gs://folder/vid2.avi,car,0,60.5
 *  *  For Text Extraction:
 *         CSV file(s) with each line in format:
 *           ML_USE,GCS_FILE_PATH
 *           GCS_FILE_PATH leads to a .JSONL (i.e. JSON Lines) file which either
 *           imports text in-line or as documents.
 *           The in-line .JSONL file contains, per line, a proto that wraps a
 *             TextSnippet proto (in json representation) followed by one or
 *             more AnnotationPayload protos (called annotations), which have
 *             display_name and text_extraction detail populated.
 *             Given text is expected to be annotated exhaustively, e.g. if you
 *             look for animals and text contains "dolphin" that is not labeled,
 *             then "dolphin" will be assumed to not be an animal.
 *             Any given text snippet content must have 30,000 characters or
 *             less, and also be UTF-8 NFC encoded (ASCII already is).
 *           The document .JSONL file contains, per line, a proto that wraps a
 *             Document proto with input_config set. Only PDF documents are
 *             supported now, and each document may be up to 2MB large.
 *             Currently annotations on documents cannot be specified at import.
 *           Any given .JSONL file must be 100MB or smaller.
 *         Three sample CSV rows:
 *           TRAIN,gs://folder/file1.jsonl
 *           VALIDATE,gs://folder/file2.jsonl
 *           TEST,gs://folder/file3.jsonl
 *         Sample in-line JSON Lines file (presented here with artificial line
 *         breaks, but the only actual line break is denoted by \n).:
 *           {
 *             "text_snippet": {
 *               "content": "dog car cat"
 *             },
 *             "annotations": [
 *                {
 *                  "display_name": "animal",
 *                  "text_extraction": {
 *                    "text_segment": {"start_offset": 0, "end_offset": 2}
 *                  }
 *                },
 *                {
 *                  "display_name": "vehicle",
 *                  "text_extraction": {
 *                    "text_segment": {"start_offset": 4, "end_offset": 6}
 *                  }
 *                },
 *                {
 *                  "display_name": "animal",
 *                  "text_extraction": {
 *                    "text_segment": {"start_offset": 8, "end_offset": 10}
 *                  }
 *                }
 *             ]
 *           }\n
 *           {
 *              "text_snippet": {
 *                "content": "This dog is good."
 *              },
 *              "annotations": [
 *                 {
 *                   "display_name": "animal",
 *                   "text_extraction": {
 *                     "text_segment": {"start_offset": 5, "end_offset": 7}
 *                   }
 *                 }
 *              ]
 *           }
 *         Sample document JSON Lines file (presented here with artificial line
 *         breaks, but the only actual line break is denoted by \n).:
 *           {
 *             "document": {
 *               "input_config": {
 *                 "gcs_source": { "input_uris": [ "gs://folder/document1.pdf" ]
 *                 }
 *               }
 *             }
 *           }\n
 *           {
 *             "document": {
 *               "input_config": {
 *                 "gcs_source": { "input_uris": [ "gs://folder/document2.pdf" ]
 *                 }
 *               }
 *             }
 *           }
 *   *  For Tables:
 *         Either
 *         gcs_source or
 *
 * bigquery_source
 *         can be used. All inputs will be concatenated into a single
 *
 * primary_table
 *         For gcs_source:
 *           CSV file(s), where first file must have a header containing unique
 *           column names, other files may have such header line too, and all
 *           other lines contain values for the header columns. Each line must
 *           have 1,000,000 or fewer characters.
 *           First three sample rows of a CSV file:
 *           "Id","First Name","Last Name","Dob","Addresses"
 *
 * "1","John","Doe","1968-01-22","[{"status":"current","address":"123_First_Avenue","city":"Seattle","state":"WA","zip":"11111","numberOfYears":"1"},{"status":"previous","address":"456_Main_Street","city":"Portland","state":"OR","zip":"22222","numberOfYears":"5"}]"
 *
 * "2","Jane","Doe","1980-10-16","[{"status":"current","address":"789_Any_Avenue","city":"Albany","state":"NY","zip":"33333","numberOfYears":"2"},{"status":"previous","address":"321_Main_Street","city":"Hoboken","state":"NJ","zip":"44444","numberOfYears":"3"}]}
 *         For bigquery_source:
 *           An URI of a BigQuery table.
 *         An imported table must have between 2 and 1,000 columns, inclusive,
 *         and between 1,000 and 10,000,000 rows, inclusive.
 *
 *  *  For Text Sentiment:
 *         CSV file(s) with each line in format:
 *           ML_USE,TEXT_SNIPPET,SENTIMENT
 *           TEXT_SNIPPET must have up to 500 characters.
 *         Three sample rows:
 *         TRAIN,"@freewrytin God is way too good for Claritin",2
 *         TRAIN,"I need Claritin so bad",3
 *         TEST,"Thank god for Claritin.",4
 *
 *  Definitions:
 *  ML_USE = "TRAIN" | "VALIDATE" | "TEST" | "UNASSIGNED"
 *           Describes how the given example (file) should be used for model
 *           training. "UNASSIGNED" can be used when user has no preference.
 *  GCS_FILE_PATH = A path to file on GCS, e.g. "gs://folder/image1.png".
 *  LABEL = A display name of an object on an image, video etc., e.g. "dog".
 *          Must be up to 32 characters long and can consist only of ASCII
 *          Latin letters A-Z and a-z, underscores(_), and ASCII digits 0-9.
 *          For each label an AnnotationSpec is created which display_name
 *          becomes the label; AnnotationSpecs are given back in predictions.
 *  INSTANCE_ID = A positive integer that identifies a specific instance of a
 *                labeled entity on an example. Used e.g. to track two cars on
 *                a video while being able to tell apart which one is which.
 *  BOUNDING_BOX = VERTEX,VERTEX,VERTEX,VERTEX | VERTEX,,,VERTEX,,
 *                 A rectangle parallel to the frame of the example (image,
 *                 video). If 4 vertices are given they are connected by edges
 *                 in the order provided, if 2 are given they are recognized
 *                 as diagonally opposite vertices of the rectangle.
 *  VERTEX = COORDINATE,COORDINATE
 *           First coordinate is horizontal (x), the second is vertical (y).
 *  COORDINATE = A float in 0 to 1 range, relative to total length of
 *               image or video in given dimension. For fractions the
 *               leading non-decimal 0 can be omitted (i.e. 0.3 = .3).
 *               Point 0,0 is in top left.
 *  TIME_SEGMENT_START = TIME_OFFSET
 *                       Expresses a beginning, inclusive, of a time segment
 *                       within an example that has a time dimension
 *                       (e.g. video).
 *  TIME_SEGMENT_END = TIME_OFFSET
 *                     Expresses an end, exclusive, of a time segment within
 *                     an example that has a time dimension (e.g. video).
 *  TIME_OFFSET = A number of seconds as measured from the start of an
 *                example (e.g. video). Fractions are allowed, up to a
 *                microsecond precision. "inf" is allowed, and it means the end
 *                of the example.
 *  TEXT_SNIPPET = A content of a text snippet, UTF-8 encoded.
 *  SENTIMENT = An integer between 0 and
 *              Dataset.text_sentiment_dataset_metadata.sentiment_max
 *              (inclusive). Describes the ordinal of the sentiment - higher
 *              value means a more positive sentiment. All the values are
 *              completely relative, i.e. neither 0 needs to mean a negative or
 *              neutral sentiment nor sentiment_max needs to mean a positive one
 *              - it is just required that 0 is the least positive sentiment
 *              in the data, and sentiment_max is the  most positive one.
 *              The SENTIMENT shouldn't be confused with "score" or "magnitude"
 *              from the previous Natural Language Sentiment Analysis API.
 *              All SENTIMENT values between 0 and sentiment_max must be
 *              represented in the imported data. On prediction the same 0 to
 *              sentiment_max range will be used. The difference between
 *              neighboring sentiment values needs not to be uniform, e.g. 1 and
 *              2 may be similar whereas the difference between 2 and 3 may be
 *              huge.
 *
 *  Errors:
 *  If any of the provided CSV files can't be parsed or if more than certain
 *  percent of CSV rows cannot be processed then the operation fails and
 *  nothing is imported. Regardless of overall success or failure the per-row
 *  failures, up to a certain count cap, will be listed in
 *  Operation.metadata.partial_failures.
 *
 * @property {Object} gcsSource
 *   The Google Cloud Storage location for the input content.
 *
 *   This object should have the same structure as [GcsSource]{@link google.cloud.automl.v1beta1.GcsSource}
 *
 * @property {Object} bigquerySource
 *   The BigQuery location for the input content.
 *
 *   This object should have the same structure as [BigQuerySource]{@link google.cloud.automl.v1beta1.BigQuerySource}
 *
 * @property {Object.<string, string>} params
 *   Additional domain-specific parameters describing the semantic of the
 *   imported data, any string must be up to 25000
 *   characters long.
 *
 *   *  For Tables:
 *      `schema_inference_version` - (integer) Required. The version of the
 *          algorithm that should be used for the initial inference of the
 *          schema (columns' DataTypes) of the table the data is being imported
 *          into. Allowed values: "1".
 *
 * @typedef InputConfig
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.InputConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const InputConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Input configuration for BatchPredict Action.
 *
 * The format of input depends on the ML problem of the model used for
 * prediction. As input source the
 * gcs_source
 * is expected, unless specified otherwise.
 *
 * The formats are represented in EBNF with commas being literal and with
 * non-terminal symbols defined near the end of this comment. The formats are:
 *
 *  *  For Video Classification:
 *         CSV file(s) with each line in format:
 *           GCS_FILE_PATH,TIME_SEGMENT_START,TIME_SEGMENT_END
 *           GCS_FILE_PATH leads to video of up to 50GB in size and up to 3h
 *           duration. Supported extensions: .MOV, .MPEG4, .MP4, .AVI.
 *           TIME_SEGMENT_START and TIME_SEGMENT_END must be within the
 *           length of the video, and end has to be after the start.
 *         Three sample rows:
 *           gs://folder/video1.mp4,10,40
 *           gs://folder/video1.mp4,20,60
 *           gs://folder/vid2.mov,0,inf
 *
 *  * For Text Extraction
 *         .JSONL (i.e. JSON Lines) file(s) which either provide text in-line or
 *         as documents (for a single BatchPredict call only one of the these
 *         formats may be used).
 *         The in-line .JSONL file(s) contain per line a proto that
 *           wraps a temporary user-assigned TextSnippet ID (string up to 2000
 *           characters long) called "id" followed by a TextSnippet proto (in
 *           json representation). Any given text snippet content must have
 *           30,000 characters or less, and also be UTF-8 NFC encoded (ASCII
 *           already is). The IDs provided should be unique.
 *         The document .JSONL file(s) contain, per line, a proto that wraps a
 *           Document proto with input_config set. Only PDF documents are
 *           supported now, and each document must be up to 2MB large.
 *         Any given .JSONL file must be 100MB or smaller, and no more than 20
 *         files may be given.
 *         Sample in-line JSON Lines file (presented here with artificial line
 *         breaks, but the only actual line break is denoted by \n):
 *           {
 *             "id": "my_first_id",
 *             "text_snippet": { "content": "dog car cat"}
 *           }\n
 *           {
 *             "id": "2",
 *             "text_snippet": {
 *               "content": "An elaborate content",
 *               "mime_type": "text/plain"
 *             }
 *           }
 *         Sample document JSON Lines file (presented here with artificial line
 *         breaks, but the only actual line break is denoted by \n).:
 *           {
 *             "document": {
 *               "input_config": {
 *                 "gcs_source": { "input_uris": [ "gs://folder/document1.pdf" ]
 *                 }
 *               }
 *             }
 *           }\n
 *           {
 *             "document": {
 *               "input_config": {
 *                 "gcs_source": { "input_uris": [ "gs://folder/document2.pdf" ]
 *                 }
 *               }
 *             }
 *           }
 *
 *  *  For Tables:
 *         Either
 *         gcs_source or
 *
 * bigquery_source.
 *         For gcs_source:
 *           CSV file(s), where first file must have a header containing
 *           column names, other files may have such header line too, and all
 *           other lines contain values for the header columns. The column
 *           names must be exactly same (order may differ) as the model's
 *
 * input_feature_column_specs'
 *           display_names, with
 *           values compatible with these column specs data types.
 *           Prediction on all the rows, i.e. the CSV lines, will be
 *           attempted.
 *           Each line must have 1,000,000 or fewer characters.
 *           First three sample rows of a CSV file:
 *           "First Name","Last Name","Dob","Addresses"
 *
 * "John","Doe","1968-01-22","[{"status":"current","address":"123_First_Avenue","city":"Seattle","state":"WA","zip":"11111","numberOfYears":"1"},{"status":"previous","address":"456_Main_Street","city":"Portland","state":"OR","zip":"22222","numberOfYears":"5"}]"
 *
 * "Jane","Doe","1980-10-16","[{"status":"current","address":"789_Any_Avenue","city":"Albany","state":"NY","zip":"33333","numberOfYears":"2"},{"status":"previous","address":"321_Main_Street","city":"Hoboken","state":"NJ","zip":"44444","numberOfYears":"3"}]}
 *         For bigquery_source:
 *           An URI of a BigQuery table. The table's columns must be exactly
 *           same (order may differ) as all model's
 *
 * input_feature_column_specs'
 *           display_names, with
 *           data compatible with these colum specs data types.
 *           Prediction on all the rows of the table will be attempted.
 *
 *  Definitions:
 *  GCS_FILE_PATH = A path to file on GCS, e.g. "gs://folder/video.avi".
 *  TIME_SEGMENT_START = TIME_OFFSET
 *                       Expresses a beginning, inclusive, of a time segment
 *                       within an
 *                       example that has a time dimension (e.g. video).
 *  TIME_SEGMENT_END = TIME_OFFSET
 *                     Expresses an end, exclusive, of a time segment within
 *                     an example that has a time dimension (e.g. video).
 *  TIME_OFFSET = A number of seconds as measured from the start of an
 *                example (e.g. video). Fractions are allowed, up to a
 *                microsecond precision. "inf" is allowed and it means the end
 *                of the example.
 *
 *  Errors:
 *  If any of the provided CSV files can't be parsed or if more than certain
 *  percent of CSV rows cannot be processed then the operation fails and
 *  prediction does not happen. Regardless of overall success or failure the
 *  per-row failures, up to a certain count cap, will be listed in
 *  Operation.metadata.partial_failures.
 *
 * @property {Object} gcsSource
 *   The Google Cloud Storage location for the input content.
 *
 *   This object should have the same structure as [GcsSource]{@link google.cloud.automl.v1beta1.GcsSource}
 *
 * @property {Object} bigquerySource
 *   The BigQuery location for the input content.
 *
 *   This object should have the same structure as [BigQuerySource]{@link google.cloud.automl.v1beta1.BigQuerySource}
 *
 * @typedef BatchPredictInputConfig
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.BatchPredictInputConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const BatchPredictInputConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Input configuration of a Document.
 *
 * @property {Object} gcsSource
 *   The Google Cloud Storage location of the document file. Only a single path
 *   should be given.
 *   Max supported size: 512MB.
 *   Supported extensions: .PDF.
 *
 *   This object should have the same structure as [GcsSource]{@link google.cloud.automl.v1beta1.GcsSource}
 *
 * @typedef DocumentInputConfig
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.DocumentInputConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const DocumentInputConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Output configuration for ExportData.
 *
 * As destination the
 * gcs_destination
 * must be set unless specified otherwise for a domain.
 * Only ground truth annotations are exported (not approved annotations are
 * not exported).
 *
 * The outputs correspond to how the data was imported, and may be used as
 * input to import data. The output formats are represented as EBNF with literal
 * commas and same non-terminal symbols definitions are these in import data's
 * InputConfig:
 *
 *  *  For Image Object Detection:
 *         CSV file(s) `image_object_detection_1.csv`,
 *         `image_object_detection_2.csv`,...,`image_object_detection_N.csv`
 *         with each line in format:
 *         ML_USE,GCS_FILE_PATH,LABEL,BOUNDING_BOX
 *         where GCS_FILE_PATHs point at the original, source locations of the
 *         imported images.
 *
 *  *  For Video Classification:
 *         CSV file `video_classification.csv`, with each line in format:
 *         ML_USE,GCS_FILE_PATH
 *         (may have muliple lines per a single ML_USE).
 *         Each GCS_FILE_PATH leads to another .csv file which
 *         describes examples that have given ML_USE, using the following
 *         row format:
 *         GCS_FILE_PATH,LABEL,TIME_SEGMENT_START,TIME_SEGMENT_END
 *         Here GCS_FILE_PATHs point at the original, source locations of the
 *         imported videos.
 *  *  For Text Extraction:
 *         CSV file `text_extraction.csv`, with each line in format:
 *         ML_USE,GCS_FILE_PATH
 *         GCS_FILE_PATH leads to a .JSONL (i.e. JSON Lines) file which
 *         contains, per line, a proto that wraps a TextSnippet proto (in json
 *         representation) followed by AnnotationPayload protos (called
 *         annotations). If initially documents had been imported, corresponding
 *         OCR-ed representation is returned.
 *
 *   *  For Tables:
 *         Output depends on whether the dataset was imported from GCS or
 *         BigQuery.
 *         GCS case:
 *
 * gcs_destination
 *           must be set. Exported are CSV file(s) `tables_1.csv`,
 *           `tables_2.csv`,...,`tables_N.csv` with each having as header line
 *           the table's column names, and all other lines contain values for
 *           the header columns.
 *         BigQuery case:
 *
 * bigquery_destination
 *           pointing to a BigQuery project must be set. In the given project a
 *           new dataset will be created with name
 *
 * `export_data_<automl-dataset-display-name>_<timestamp-of-export-call>`
 *           where <automl-dataset-display-name> will be made
 *           BigQuery-dataset-name compatible (e.g. most special characters will
 *           become underscores), and timestamp will be in
 *           YYYY_MM_DDThh_mm_ss_sssZ "based on ISO-8601" format. In that
 *           dataset a new table called `primary_table` will be created, and
 *           filled with precisely the same data as this obtained on import.
 *
 * @property {Object} gcsDestination
 *   The Google Cloud Storage location where the output is to be written to.
 *   For Image Object Detection, Text Extraction, Video Classification and
 *   Tables, in the given directory a new directory will be created with name:
 *   export_data-<dataset-display-name>-<timestamp-of-export-call>
 *   where timestamp is in YYYY-MM-DDThh:mm:ss.sssZ ISO-8601 format. All
 *   export output will be written into that directory.
 *
 *   This object should have the same structure as [GcsDestination]{@link google.cloud.automl.v1beta1.GcsDestination}
 *
 * @property {Object} bigqueryDestination
 *   The BigQuery location where the output is to be written to.
 *
 *   This object should have the same structure as [BigQueryDestination]{@link google.cloud.automl.v1beta1.BigQueryDestination}
 *
 * @typedef OutputConfig
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.OutputConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const OutputConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Output configuration for BatchPredict Action.
 *
 * As destination the
 *
 * gcs_destination
 * must be set unless specified otherwise for a domain. If gcs_destination is
 * set then in the given directory a new directory will be created. Its name
 * will be
 * "prediction-<model-display-name>-<timestamp-of-prediction-call>",
 * where timestamp is in YYYY-MM-DDThh:mm:ss.sssZ ISO-8601 format. The contents
 * of it depend on the ML problem the predictions are made for.
 *
 *  *  For Video Classification:
 *         In the created directory a video_classification.csv file, and a .JSON
 *         file per each video classification requested in the input (i.e. each
 *         line in given CSV(s)), will be created.
 *
 *         The format of video_classification.csv is:
 *
 * GCS_FILE_PATH,TIME_SEGMENT_START,TIME_SEGMENT_END,JSON_FILE_NAME,STATUS
 *         where:
 *         GCS_FILE_PATH,TIME_SEGMENT_START,TIME_SEGMENT_END = matches 1 to 1
 *             the prediction input lines (i.e. video_classification.csv has
 *             precisely the same number of lines as the prediction input had.)
 *         JSON_FILE_NAME = Name of .JSON file in the output directory, which
 *             contains prediction responses for the video time segment.
 *         STATUS = "OK" if prediction completed successfully, or an error
 *             code and,or message otherwise. If STATUS is not "OK" then the
 *             .JSON file for that line may not exist or be empty.
 *
 *         Each .JSON file, assuming STATUS is "OK", will contain a list of
 *         AnnotationPayload protos in JSON format, which are the predictions
 *         for the video time segment the file is assigned to in the
 *         video_classification.csv. All AnnotationPayload protos will have
 *         video_classification field set, and will be sorted by
 *         video_classification.type field (note that the returned types are
 *         governed by `classifaction_types` parameter in
 *         PredictService.BatchPredictRequest.params).
 *   *  For Text Extraction:
 *         In the created directory files `text_extraction_1.jsonl`,
 *         `text_extraction_2.jsonl`,...,`text_extraction_N.jsonl`
 *         will be created, where N may be 1, and depends on the
 *         total number of inputs and annotations found.
 *         The contents of these .JSONL file(s) depend on whether the input
 *         used inline text, or documents.
 *         If input was inline, then each .JSONL file will contain, per line,
 *           a JSON representation of a proto that wraps given in request text
 *           snippet's "id" : "<id_value>" followed by a list of zero or more
 *           AnnotationPayload protos (called annotations), which have
 *           text_extraction detail populated. A single text snippet will be
 *           listed only once with all its annotations, and its annotations will
 *           never be split across files.
 *         If input used documents, then each .JSONL file will contain, per
 *           line, a JSON representation of a proto that wraps given in request
 *           document proto, followed by its OCR-ed representation in the form
 *           of a text snippet, finally followed by a list of zero or more
 *           AnnotationPayload protos (called annotations), which have
 *           text_extraction detail populated and refer, via their indices, to
 *           the OCR-ed text snippet. A single document (and its text snippet)
 *           will be listed only once with all its annotations, and its
 *           annotations will never be split across files.
 *         If prediction for any text snippet failed (partially or completely),
 *         then additional `errors_1.jsonl`, `errors_2.jsonl`,...,
 *         `errors_N.jsonl` files will be created (N depends on total number of
 *         failed predictions). These files will have a JSON representation of a
 *         proto that wraps either the "id" : "<id_value>" (in case of inline)
 *         or the document proto (in case of document) but here followed by
 *         exactly one
 *
 * [`google.rpc.Status`](https:
 * //github.com/googleapis/googleapis/blob/master/google/rpc/status.proto)
 *         containing only `code` and `message`.
 *
 *  *  For Tables:
 *         Output depends on whether
 *
 * gcs_destination
 *         or
 *
 * bigquery_destination
 *         is set (either is allowed).
 *         GCS case:
 *           In the created directory files `tables_1.csv`, `tables_2.csv`,...,
 *           `tables_N.csv` will be created, where N may be 1, and depends on
 *           the total number of the successfully predicted rows.
 *           For the classification models:
 *             Each .csv file will contain a header, listing all model's
 *
 * input_feature_column_specs'
 *
 * display_names
 *             followed by M target column names in the format of
 *
 * "<target_column_specs
 *
 * display_name>_<target
 *             value>_score" where M is the number of distinct target values,
 *             i.e. number of distinct values in the target column of the table
 *             used to train the model. Subsequent lines will contain the
 *             respective values of successfully predicted rows, with the last,
 *             i.e. the target, columns having the corresponding prediction
 *             scores.
 *           For the regression models:
 *             Each .csv file will contain a header, listing all model's
 *
 * input_feature_column_specs
 *             display_names
 *             followed by the target column with name equal to
 *
 * target_column_specs'
 *
 * display_name.
 *             Subsequent lines will contain the respective values of
 *             successfully predicted rows, with the last, i.e. the target,
 *             column having the predicted target value.
 *           If prediction for any rows failed, then an additional
 *           `errors_1.csv`, `errors_2.csv`,..., `errors_N.csv` will be created
 *           (N depends on total number of failed rows). These files will have
 *           analogous format as `tables_*.csv`, but always with a single target
 *           column having
 *
 * [`google.rpc.Status`](https:
 * //github.com/googleapis/googleapis/blob/master/google/rpc/status.proto)
 *           represented as a JSON string, and containing only `code` and
 *           `message`.
 *        BigQuery case:
 *
 * bigquery_destination
 *           pointing to a BigQuery project must be set. In the given project a
 *           new dataset will be created with name
 *           `prediction_<model-display-name>_<timestamp-of-prediction-call>`
 *           where <model-display-name> will be made
 *           BigQuery-dataset-name compatible (e.g. most special characters will
 *           become underscores), and timestamp will be in
 *           YYYY_MM_DDThh_mm_ss_sssZ "based on ISO-8601" format. In the dataset
 *           two tables will be created, `predictions`, and `errors`.
 *           The `predictions` table's column names will be the
 *
 * input_feature_column_specs'
 *
 * display_names
 *           followed by model's
 *
 * target_column_specs'
 *
 * display_name.
 *           The input feature columns will contain the respective values of
 *           successfully predicted rows, with the target column having an
 *           ARRAY of
 *
 * AnnotationPayloads,
 *           represented as STRUCT-s, containing
 *           TablesAnnotation.
 *           The `errors` table contains rows for which the prediction has
 *           failed, it has analogous input feature and target columns, but
 *           here the target column as a value has
 *
 * [`google.rpc.Status`](https:
 * //github.com/googleapis/googleapis/blob/master/google/rpc/status.proto)
 *           represented as a STRUCT, and containing only `code` and `message`.
 *
 * @property {Object} gcsDestination
 *   The Google Cloud Storage location of the directory where the output is to
 *   be written to.
 *
 *   This object should have the same structure as [GcsDestination]{@link google.cloud.automl.v1beta1.GcsDestination}
 *
 * @property {Object} bigqueryDestination
 *   The BigQuery location where the output is to be written to.
 *
 *   This object should have the same structure as [BigQueryDestination]{@link google.cloud.automl.v1beta1.BigQueryDestination}
 *
 * @typedef BatchPredictOutputConfig
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.BatchPredictOutputConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const BatchPredictOutputConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Output configuration for ModelExport Action.
 *
 * @property {Object} gcsDestination
 *   The Google Cloud Storage location where the model is to be written to.
 *   This location may only be set for the following model formats:
 *     "tflite", "edgetpu_tflite", "core_ml", "docker".
 *
 *    Under the directory given as the destination a new one with name
 *    "model-export-<model-display-name>-<timestamp-of-export-call>",
 *    where timestamp is in YYYY-MM-DDThh:mm:ss.sssZ ISO-8601 format,
 *    will be created. Inside the model and any of its supporting files
 *    will be written.
 *
 *   This object should have the same structure as [GcsDestination]{@link google.cloud.automl.v1beta1.GcsDestination}
 *
 * @property {Object} gcrDestination
 *   The GCR location where model image is to be pushed to. This location
 *   may only be set for the following model formats:
 *     "docker".
 *
 *   The model image will be created under the given URI.
 *
 *   This object should have the same structure as [GcrDestination]{@link google.cloud.automl.v1beta1.GcrDestination}
 *
 * @property {string} modelFormat
 *   The format in which the model must be exported. The available, and default,
 *   formats depend on the problem and model type (if given problem and type
 *   combination doesn't have a format listed, it means its models are not
 *   exportable):
 *
 *   *  For Image Classification mobile-low-latency-1, mobile-versatile-1,
 *          mobile-high-accuracy-1:
 *        "tflite" (default), "edgetpu_tflite", "tf_saved_model", "docker".
 *
 *   *  For Image Classification mobile-core-ml-low-latency-1,
 *          mobile-core-ml-versatile-1, mobile-core-ml-high-accuracy-1:
 *        "core_ml" (default).
 *   Formats description:
 *
 *   * tflite - Used for Android mobile devices.
 *   * edgetpu_tflite - Used for [Edge TPU](https://cloud.google.com/edge-tpu/)
 *                      devices.
 *   * tf_saved_model - A tensorflow model in SavedModel format.
 *   * docker - Used for Docker containers. Use the params field to customize
 *              the container. The container is verified to work correctly on
 *              ubuntu 16.04 operating system.
 *   * core_ml - Used for iOS mobile devices.
 *
 * @property {Object.<string, string>} params
 *   Additional model-type and format specific parameters describing the
 *   requirements for the to be exported model files, any string must be up to
 *   25000 characters long.
 *
 *    * For `docker` format:
 *       `cpu_architecture` - (string) "x86_64" (default).
 *       `gpu_architecture` - (string) "none" (default), "nvidia".
 *
 * @typedef ModelExportOutputConfig
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.ModelExportOutputConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const ModelExportOutputConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Output configuration for ExportEvaluatedExamples Action. Note that this call
 * is available only for 30 days since the moment the model was evaluated.
 * The output depends on the domain, as follows (note that only examples from
 * the TEST set are exported):
 *
 *  *  For Tables:
 *
 * bigquery_destination
 *       pointing to a BigQuery project must be set. In the given project a
 *       new dataset will be created with name
 *
 * `export_evaluated_examples_<model-display-name>_<timestamp-of-export-call>`
 *       where <model-display-name> will be made BigQuery-dataset-name
 *       compatible (e.g. most special characters will become underscores),
 *       and timestamp will be in YYYY_MM_DDThh_mm_ss_sssZ "based on ISO-8601"
 *       format. In the dataset an `evaluated_examples` table will be
 *       created. It will have all the same columns as the
 *       primary
 *
 * table
 *       of the
 *       dataset from which
 *       the model was created, as they were at the moment of model's
 *       evaluation (this includes the target column with its ground
 *       truth), followed by a column called "predicted_<target_column>". That
 *       last column will contain the model's prediction result for each
 *       respective row, given as ARRAY of
 *       AnnotationPayloads,
 *       represented as STRUCT-s, containing
 *       TablesAnnotation.
 *
 * @property {Object} bigqueryDestination
 *   The BigQuery location where the output is to be written to.
 *
 *   This object should have the same structure as [BigQueryDestination]{@link google.cloud.automl.v1beta1.BigQueryDestination}
 *
 * @typedef ExportEvaluatedExamplesOutputConfig
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.ExportEvaluatedExamplesOutputConfig definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const ExportEvaluatedExamplesOutputConfig = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The Google Cloud Storage location for the input content.
 *
 * @property {string[]} inputUris
 *   Required. Google Cloud Storage URIs to input files, up to 2000 characters
 *   long. Accepted forms:
 *   * Full object path, e.g. gs://bucket/directory/object.csv
 *
 * @typedef GcsSource
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.GcsSource definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const GcsSource = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The BigQuery location for the input content.
 *
 * @property {string} inputUri
 *   Required. BigQuery URI to a table, up to 2000 characters long.
 *   Accepted forms:
 *   *  BigQuery path e.g. bq://projectId.bqDatasetId.bqTableId
 *
 * @typedef BigQuerySource
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.BigQuerySource definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const BigQuerySource = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The Google Cloud Storage location where the output is to be written to.
 *
 * @property {string} outputUriPrefix
 *   Required. Google Cloud Storage URI to output directory, up to 2000
 *   characters long.
 *   Accepted forms:
 *   * Prefix path: gs://bucket/directory
 *   The requesting user must have write permission to the bucket.
 *   The directory is created if it doesn't exist.
 *
 * @typedef GcsDestination
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.GcsDestination definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const GcsDestination = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The BigQuery location for the output content.
 *
 * @property {string} outputUri
 *   Required. BigQuery URI to a project, up to 2000 characters long.
 *   Accepted forms:
 *   *  BigQuery path e.g. bq://projectId
 *
 * @typedef BigQueryDestination
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.BigQueryDestination definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const BigQueryDestination = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The GCR location where the image must be pushed to.
 *
 * @property {string} outputUri
 *   Required. Google Contained Registry URI of the new image, up to 2000
 *   characters long. See
 *
 *   https:
 *   //cloud.google.com/container-registry/do
 *   // cs/pushing-and-pulling#pushing_an_image_to_a_registry
 *   Accepted forms:
 *   * [HOSTNAME]/[PROJECT-ID]/[IMAGE]
 *   * [HOSTNAME]/[PROJECT-ID]/[IMAGE]:[TAG]
 *
 *   The requesting user must have permission to push images the project.
 *
 * @typedef GcrDestination
 * @memberof google.cloud.automl.v1beta1
 * @see [google.cloud.automl.v1beta1.GcrDestination definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/cloud/automl/v1beta1/io.proto}
 */
const GcrDestination = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};